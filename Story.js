class Story {
    constructor(props = {}) {
        this.deferreds = [];

        this.state = {};

        this._log = props.log;

        this.info = {
            processBegin: true,
            showStoryBegin: false,
            showStageBegin: false,
        }

        this.log = this.log.bind(this);
        this.error = this.error.bind(this);
        this.fireNextStage = this.fireNextStage.bind(this);
    }

    log(msg, oneLiner) {
        if (!this._log) return;

        this._log.log(msg, oneLiner);
    }

    error(msg, err) {
        if (!this._log) return;

        this._log.error(msg);

        if (this.startReject) {
            this.startReject.call(this, [msg, err]);
        }
    }

    setState(key, value) {
        if (typeof key === 'object') {
            this.state = {...this.state, ...key};
        } else if (typeof key === 'string') {
            this.state[key] = value;
        }
    }

    addMethod(key, method) {
        this.firstKey = this.firstKey || key;
        const promise = this.generatePromise(key);

        promise
            .then(() => method.call(this, this.state, this.fireNextStage, this.error, this.log))
            .catch(err => this.catchError(err));
    }

    catchError(err) {
        if (!this.running) return;

        this.startReject.call(this, ['', err]);
    }

    start(firstStory, stories) {

        if (this.info.processBegin) {
            this.log('starting process...', true);
        }

        this.running = true;

        this.stories = stories;

        this.fireStory(firstStory);

        return new Promise((resolve, reject) => {
            this.startResolve = resolve;
            this.startReject = reject;
        });
    }

    firePromise(key, err, json) {
        const promise = this.findPromise(key);

        if (promise) {
            if (!err) {
                promise.resolve(json)
            } else {
                promise.reject(err);
            }
        }
    }

    findPromise(key) {
        let output = '';

        this.deferreds.forEach(d => {
            if (d.key === key) {
                output = d;
            }
        });

        return output;
    }

    findStory(key) {
        return this.stories[key];
    }

    fireStage(key) {
        if (this.info.showStageBegin) {
            this.log(`fire stage ${key}`, true);
        }

        this.firePromise(key);
    }

    checkStoryStage(stage = '') {
        return stage.indexOf(':') >= 0 || stage.indexOf('story') === 0;
    }

    fireNextStage(lastStageResult) {

        if (typeof lastStageResult === 'object') {
            this.setState(lastStageResult);
        }

        const {currentStory, currentStageIndex} = this.state;

        const nextStage = currentStory[currentStageIndex];

        if (this.checkStoryStage(nextStage)) {
            this.fireStoryStage(nextStage, lastStageResult);
            return;
        }

        if (nextStage) {
            this.fireStage(nextStage);

            this.setState({
                currentStageIndex: currentStageIndex + 1
            });
        } else {
            // process ended
            this.log('process ended', true);

            if (this.startResolve) {
                this.startResolve.call(this);
            }

            this.clear();
        }
    }

    setCurrentStory(story) {
        this.setState({
            currentStory: story,
            currentStageIndex: 0
        });
    }

    fireStory(storyId) {
        if (this.info.showStoryBegin) {
            this.log(`fire story ${storyId}`, true);
        }

        const story = this.findStory(storyId);

        this.setCurrentStory(story);

        this.fireNextStage();
    }

    fireSplitStory(stage, lastStageResult) {
        const stories = stage.split(':'),
            storyA = stories[0].trim(),
            storyB = stories[1].trim();

        if (lastStageResult) {
            this.fireStory(storyA);
        } else {
            this.fireStory(storyB);
        }
    }

    fireStoryStage(nextStage = '', lastStageResult) {
        if (nextStage.indexOf(':') >= 0) {
            this.fireSplitStory(nextStage, lastStageResult);
        } else {
            this.fireStory(nextStage);
        }
    }

    generatePromise(key) {
        return new Promise((resolve, reject) => {
            this.deferreds.push({resolve: resolve, reject: reject, key: key});
        });
    }

    clear() {
        this.running = false;

        this.state = {};

        this.stories = {};

        this.deferreds.forEach(deferred => {
            deferred.reject();
        });

        this.deferreds = [];
    }
}

module.exports = Story;