export type Partition<T> = {
    [Key in string | number]: Array<T>;
};
export type FilterFunc<T> = (item: T, index: number, array: Array<T>) => boolean
export type PartitionFunc<T> = (item: T, index: number, array: Array<T>) => string | number

export function AddAlgorithms() {

    Object.defineProperty(Array.prototype, 'shuffle', {
        value: function () {
            // Knuth shuffle
            for (let i = this.length; i > 0;) {
                const j = Math.floor(Math.random() * i);
                --i;
                const tmp = this[i];
                this[i] = this[j];
                this[j] = tmp;
            }
            return this;
        }
    });

    Object.defineProperty(Array.prototype, 'partition', {
        value:
            function <T>(filter: PartitionFunc<T>) {
                const partitions: Partition<T> = {};
                let index = 0;
                for (const item of this) {
                    const k = filter(item, index++, this);
                    if (partitions[k] === undefined)
                        partitions[k] = [];
                    partitions[k].push(item);
                }
                return partitions;
            }
    })
}