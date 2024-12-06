import streamingClass from '../utils/StreamingClass.js';

// checking streaming data by stream id
export const checkStreaming = (req, res, next) => {
  let { streamId } = req.body;
  // getting data as normal. If stream id defined, then get it from local database
  if (!streamId) {
    next();
  } else {
    // getting data from streamData
    let { streamData, cutoff } = streamingClass.get(streamId);
    const results = streamData.splice(0, cutoff);
    // if empty
    if (streamData.length === 0) {
      // unset if it is empty
      streamingClass.unset(streamId);
      streamId = -1;
    } else {
      // if not empty yet
      streamingClass.update(streamId, streamData);
    }
    // res.prints = {
    //   streamId,
    //   results,
    // };
    // next();
    res.status(200).json({
      status: 'success',
      streamId,
      results,
    });
  }
};
