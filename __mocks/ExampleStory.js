const Story  = require('../Story');

const delayedPromise = () => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, Math.floor(Math.random() * 1000 * 5));
    });
}

const a = async (state, next, error, log) => {
    log('a is... ');
    log(state.a);
    await delayedPromise();
    next({one: 1});
}

const b = async (state, next, error, log) => {
    log('one is... ');
    log(state.one);
    await delayedPromise();
    next({two: Math.random()});
}

const c = async (state, next, error, log) => {
    log('two is... ');
    log(state.two);
    await delayedPromise();
    next(Math.random() > 0.5);
}

const d = async (state, next, error, log) => {
    console.log('state ->', state);
    log('two is still... ');
    log(state.two);
    await delayedPromise();
    next();
}


const e = async (state, next, error, log) => {
    log('two is still... ');
    log(state.two);
    await delayedPromise();
    next();
}

class ExampleStory extends Story {
    constructor(props) {
        super(props);

        this.info = {
            processBegin: true,
            showStoryBegin: true,
            showStageBegin: true,
        }

        this.addMethod('a', a);
        this.addMethod('b', b);
        this.addMethod('c', c);
        this.addMethod('d', d);
        this.addMethod('e', e);
    }
}



module.exports = ExampleStory;