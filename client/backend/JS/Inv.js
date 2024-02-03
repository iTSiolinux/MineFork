class Inv {
    constructor(values) {
        this.maxSlots = values?.maxSlots || 8;
        this.handIndex = 0;
        this.offHandIndex = 1;
        this.items = values?.items || [];
        this.armor = {
            head: values?.armor?.head || null,
            chest: values?.armor?.chest || null,
            legs: values?.armor?.legs || null,
            boots: values?.armor?.boots || null,
        };
    }

    addItem(item) {
        if (item instanceof Item && this.items.length < this.maxSlots)
            this.items.push(item);
    }

    removeItem(item) {
        if (item instanceof Item)
            this.items.pop(item);
    }
}