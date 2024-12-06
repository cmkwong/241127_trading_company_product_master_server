import { spawn } from 'child_process';

export const run = (path, script, args) => {
  return new Promise((resolve, rejcet) => {
    const pythonProcess = spawn('python', [`${path}/${script}`, ...args]);
    pythonProcess.stdout.on('data', (data) => {
      resolve(data);
    });
  });
};

// exports.run = run;
