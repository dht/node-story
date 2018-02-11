# node-story

Create stateful waterfall scenarios easily:

```js
const ExampleStory = require('./ExampleStory');
const log = require('./log');

const exampleStory = new ExampleStory({log: log});

exampleStory.setState({a: 3});

exampleStory
    .start('story1', {
        story1: ['a', 'b', 'c', 'story2:story3'],
        story2: ['d'],
        story3: ['e'],
    })
    .then(() => {
        console.log('done ->', true);
    })
    .catch(err => {
        console.log('err ->', err);
    })

```

## Incentive
Create easy tested