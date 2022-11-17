import Generation from './index';
import GenerationTable from './table';

export default class GenerationEngine {
  generation!: Generation;
  timer!: NodeJS.Timeout;
  constructor() {
    this.generation;
    this.timer;
  }

  start() {
    this.buildNewGeneration();
  }

  stop() {
    clearTimeout(this.timer);
  }

  buildNewGeneration() {
    const generation = new Generation();

    GenerationTable.storeGeneration(generation)
      .then(({ generationId }) => {
        this.generation = generation;

        this.generation.generationId = generationId;

        console.log('new generation', this.generation);

        this.timer = setTimeout(() => {
          this.buildNewGeneration();
        }, this.generation.expiration.getTime() - Date.now());
      })
      .catch((error) => console.error(error));
  }
}
