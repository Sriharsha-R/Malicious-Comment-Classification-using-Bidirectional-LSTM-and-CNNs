const tf = require('@tensorflow/tfjs-node');
const data = require('./misc/sample.json');

const checkPost = async (postText) => {
  try {
    const model = await tf.loadLayersModel(
      `file://${__dirname}/misc/model.json`
    );
    let input = postText;
    input = input.toLowerCase();
    let punctuation = '!"#$%&()*+,-./:;<=>?@[\\]^_`{|}~';
    let rawLetters = input.split('');
    let cleanLetters = rawLetters.filter(function (letter) {
      return punctuation.indexOf(letter) === -1;
    });
    input = cleanLetters.join('');
    let inputArray = input.split(' ');

    for (let i = 0; i < inputArray.length; i++) {
      if (inputArray[i] in data) {
        inputArray[i] = data[inputArray[i]];
      } else {
        inputArray[i] = 1;
      }
    }

    let n = 150 - inputArray.length;
    for (let i = 0; i < n; i++) {
      inputArray.push(0);
    }

    let finalText = [inputArray];
    const finalInput = tf.tensor2d(finalText);
    const result = model.predict(finalInput);
    return await result.data();
  } catch (e) {
    console.error(e);
  }
};

module.exports = checkPost;
