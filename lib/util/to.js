// https://blog.grossman.io/how-to-write-async-await-without-try-catch-blocks-in-javascript/
module.exports = (promise) => {
    return promise
        .then((data) => [null, data])
        .catch((err) => [err]);
};
