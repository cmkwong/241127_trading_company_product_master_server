import 'dotenv/config';

/*
 * Generic NanoBanana image-to-image editing module.
 *
 * These functions wrap the NanoBanana API for editing existing images:
 *   1. submitNanoBananaTask  - submit an IMAGETOIAMGE task and get a taskId
 *   2. getNanoBananaTaskInfo - query task status via the record-info endpoint
 *   3. pollNanoBananaTask    - poll until the task completes (or fails/times out)
 *   4. downloadImageBuffer   - download an image URL into a Buffer
 *   5. editImageWithNanoBanana - submit + poll + download in one call
 *
 * Polling is preferred over the webhook callback because the callback URL must
 * be publicly reachable (the development server is typically localhost-only).
 *
 * Configuration is lazy: nothing throws at import time; the API key is only
 * validated when a request is actually made.
 */

const DEFAULT_BASE_URL =
  process.env.NANOBANANA_BASE_URL || 'https://api.nanobananaapi.ai';

const GENERATE_PATH = '/api/v1/nanobanana/generate-2';
const RECORD_INFO_PATH = '/api/v1/nanobanana/record-info';

// Task status codes returned by the record-info endpoint.
const TASK_STATUS = {
  GENERATING: 0,
  SUCCESS: 1,
  CREATE_TASK_FAILED: 2,
  GENERATE_FAILED: 3,
};

const getApiKey = () => {
  const key = process.env.NANOBANANA_API_KEY;
  if (!key) {
    throw new Error('NANOBANANA_API_KEY is not configured');
  }
  return key;
};

const generateUrl = () => `${DEFAULT_BASE_URL}${GENERATE_PATH}`;

const recordInfoUrl = (taskId) =>
  `${DEFAULT_BASE_URL}${RECORD_INFO_PATH}?taskId=${encodeURIComponent(taskId)}`;

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const parseJsonBody = (rawBody, label) => {
  try {
    return JSON.parse(rawBody);
  } catch {
    throw new Error(`${label} returned non-JSON data: ${rawBody}`);
  }
};

/**
 * Submits an image-to-image editing task to NanoBanana.
 *
 * @param {Object} params
 * @param {string} params.prompt - The edit prompt.
 * @param {string[]} [params.imageUrls] - Input image URLs (IMAGETOIAMGE).
 * @param {number} [params.numImages=1] - Number of images to generate (1-4).
 * @param {string} [params.imageSize] - Optional preset aspect ratio.
 * @param {string} [params.callbackUrl] - Optional webhook callback URL.
 * @param {string} [params.type='IMAGETOIAMGE'] - Generation type.
 * @returns {Promise<string>} The taskId.
 */
export const submitNanoBananaTask = async ({
  prompt,
  imageUrls = [],
  numImages = 1,
  imageSize,
  callbackUrl,
  type = 'IMAGETOIAMGE',
} = {}) => {
  if (!prompt) {
    throw new Error('submitNanoBananaTask: prompt is required');
  }

  const payload = { prompt, type, numImages };

  if (type === 'IMAGETOIAMGE' && Array.isArray(imageUrls) && imageUrls.length) {
    payload.imageUrls = imageUrls;
  }

  if (imageSize) payload.image_size = imageSize;
  if (callbackUrl) payload.callBackUrl = callbackUrl;

  const response = await fetch(generateUrl(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const rawBody = await response.text();
  const result = parseJsonBody(rawBody, 'NanoBanana');

  if (!response.ok || result.code !== 200 || !result.data?.taskId) {
    throw new Error(
      `NanoBanana submission failed (${response.status}): ${result.msg || rawBody}`,
    );
  }

  return result.data.taskId;
};

/**
 * Queries the status/details of a NanoBanana task.
 *
 * @param {string} taskId - The task id returned by submitNanoBananaTask.
 * @returns {Promise<Object>} The `data` object from the record-info response.
 */
export const getNanoBananaTaskInfo = async (taskId) => {
  if (!taskId) {
    throw new Error('getNanoBananaTaskInfo: taskId is required');
  }

  const response = await fetch(recordInfoUrl(taskId), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
    },
  });

  const rawBody = await response.text();
  const result = parseJsonBody(rawBody, 'NanoBanana record-info');

  if (!response.ok || (result.code && result.code !== 200)) {
    throw new Error(
      `NanoBanana record-info failed (${response.status}): ${result.msg || rawBody}`,
    );
  }

  return result.data;
};

/**
 * Polls a NanoBanana task until it completes, fails, or times out.
 *
 * @param {string} taskId - The task id to poll.
 * @param {Object} [options]
 * @param {number} [options.intervalMs=15000] - Delay between polls.
 * @param {number} [options.timeoutMs=300000] - Maximum total wait time.
 * @param {Function} [options.onPoll] - Optional callback `({ taskId, successFlag, data })`.
 * @returns {Promise<string>} The result image URL.
 */
export const pollNanoBananaTask = async (taskId, options = {}) => {
  const { intervalMs = 15000, timeoutMs = 300000, onPoll } = options;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const data = await getNanoBananaTaskInfo(taskId);
    const { successFlag, response, errorCode, errorMessage } = data || {};

    if (typeof onPoll === 'function') {
      await onPoll({ taskId, successFlag, data });
    }

    if (successFlag === TASK_STATUS.SUCCESS) {
      const resultImageUrl = response?.resultImageUrl;
      if (!resultImageUrl) {
        throw new Error(
          `NanoBanana task ${taskId} succeeded but returned no resultImageUrl`,
        );
      }
      return resultImageUrl;
    }

    if (successFlag === TASK_STATUS.CREATE_TASK_FAILED) {
      throw new Error(
        `NanoBanana task ${taskId} failed to create (errorCode ${errorCode}): ${
          errorMessage || 'unknown error'
        }`,
      );
    }

    if (successFlag === TASK_STATUS.GENERATE_FAILED) {
      throw new Error(
        `NanoBanana task ${taskId} generation failed (errorCode ${errorCode}): ${
          errorMessage || 'unknown error'
        }`,
      );
    }

    await sleep(intervalMs);
  }

  throw new Error(`NanoBanana task ${taskId} timed out after ${timeoutMs}ms`);
};

/**
 * Downloads an image from a URL into a Buffer.
 * @param {string} url - The image URL.
 * @returns {Promise<Buffer>} The image bytes.
 */
export const downloadImageBuffer = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Could not download image: HTTP ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
};

/**
 * Submits an edit task, polls until complete, and (optionally) downloads the
 * resulting image. Convenience wrapper for the full editing flow.
 *
 * @param {Object} params
 * @param {string[]} params.imageUrls - Input image URLs.
 * @param {string} params.prompt - The edit prompt.
 * @param {number} [params.numImages=1]
 * @param {string} [params.imageSize]
 * @param {Object} [params.pollOptions] - See pollNanoBananaTask options.
 * @param {boolean} [params.download=true] - Download the result into a Buffer.
 * @returns {Promise<Object>} `{ taskId, resultImageUrl, buffer? }`.
 */
export const editImageWithNanoBanana = async ({
  imageUrls,
  prompt,
  numImages = 1,
  imageSize,
  pollOptions,
  download = true,
} = {}) => {
  const taskId = await submitNanoBananaTask({
    prompt,
    imageUrls,
    numImages,
    imageSize,
  });

  const resultImageUrl = await pollNanoBananaTask(taskId, pollOptions);

  const result = { taskId, resultImageUrl };

  if (download) {
    result.buffer = await downloadImageBuffer(resultImageUrl);
  }

  return result;
};

/**
 * Builds a text-replacement edit prompt (removes Chinese promotional text and
 * replaces it with provided English lines). Reusable across callers that hold
 * pre-approved translations.
 *
 * @param {Object} [params]
 * @param {string[]} [params.lines] - Approved English wording lines.
 * @param {string} [params.fallbackInstruction] - Used when no lines are given.
 * @returns {string} The assembled prompt.
 */
export const buildTextReplacementPrompt = ({
  lines = [],
  fallbackInstruction = 'Translate every visible Chinese phrase into concise, natural, professional English.',
} = {}) => {
  const translationSection =
    Array.isArray(lines) && lines.length > 0
      ? lines.map((line, index) => `${index + 1}. ${line}`).join('\n')
      : fallbackInstruction;

  return `
Edit the supplied product advertisement image.

TEXT REPLACEMENT:
Identify and completely remove all visible Simplified or Traditional Chinese
promotional text. Replace it with the approved English wording below. Use each
line in the location corresponding to the original Chinese meaning:

${translationSection}

STRICT DESIGN REQUIREMENTS:
1. Render all English accurately. Do not misspell, duplicate or invent words.
2. Replace the Chinese characters completely; do not place English over visible Chinese text.
3. Reconstruct the background naturally where Chinese text is removed.
4. Match the original typography as closely as possible, including font style, weight, size, color, line spacing, alignment and visual hierarchy.
5. Reflow or shorten the English text when necessary so that it fits naturally without overlapping the product, animals, borders or other text.
6. Preserve the original product, collar, buckle, stitching, animals, shadows, colors, background, borders and composition.
7. Do not add new products, animals, accessories, decorations or marketing claims.
8. Remove malformed pre-existing English promotional fragments when they duplicate the approved wording, and replace them with the approved English wording.
9. Do not alter legitimate logos, model numbers, certification marks or trademarks.
10. Preserve the original aspect ratio and pixel dimensions as closely as possible.
11. Return only one final edited product image with no explanation.
`.trim();
};

const bananaImage2Image = {
  submitNanoBananaTask,
  getNanoBananaTaskInfo,
  pollNanoBananaTask,
  downloadImageBuffer,
  editImageWithNanoBanana,
  buildTextReplacementPrompt,
};

export default bananaImage2Image;
