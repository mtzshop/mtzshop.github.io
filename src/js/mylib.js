class ConectionError extends Error {
    constructor(message){
        super(message);
        this.name = "ConectionError";
    }
}
class ValidationError extends Error {
    constructor(message){
        super(message);
        this.name = "ValidationError";
    }
}


const s = selector => document.querySelector(selector);
const sAll = selector => [...document.querySelectorAll(selector)];

export {s, sAll, ValidationError, ConectionError}; 

