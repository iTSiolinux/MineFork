class Inv {
    constructor(values) {
        this.maxSlots = values?.maxSlots || 8;
        this.handIndex = 0;
        this.offHandIndex = 1;
        this.items = values?.items || new Array();
        this.armor = {
            head: values?.armor?.head || null,
            chest: values?.armor?.chest || null,
            legs: values?.armor?.legs || null,
            boots: values?.armor?.boots || null,
        };
    }

    addItem(item) {
        if (item instanceof Item && this.items.length < this.maxSlots && this.items.findIndex(existingItem => existingItem instanceof VoidItem) === -1) {
            const sameItems = this.items.filter(itemArgs =>
                itemArgs.amount < itemArgs.MaxStack
                &&
                item.TYPE == itemArgs.TYPE
                &&
                item.displayName == itemArgs.displayName
                &&
                item.MaxStack == itemArgs.MaxStack
            );

            if (sameItems.length > 0) {
                sameItems.forEach(sameItem => {
                    const leftSpace = sameItem.MaxStack - sameItem.amount;

                    if (leftSpace >= item.amount) {
                        sameItem.amount += item.amount;
                        item.amount = 0
                    } else {
                        sameItem.amount += leftSpace;
                        item.amount -= leftSpace;
                    }
                })
            }

            if (item.amount > 0) {
                const voidItemIndex = this.items.findIndex(existingItem => existingItem instanceof VoidItem);

                if (voidItemIndex !== -1) {
                    this.items[voidItemIndex] = item;
                } else {
                    this.items.push(item);
                }
            }

            return true;
        }

        return false;
    }

    wearItem(item) {
        if (item instanceof Item)
            this.items.pop(item);
        this.armor[item.armorSlot] = item
    }

    unWearItem(item) {
        if (item instanceof Item)
            this.items.push(item);
        this.armor[item.armorSlot] = null
    }

    removeItem(item) {
        if (item instanceof Item) {
            let indexOfItem = this.items.findIndex(o => o == item)
            this.items[indexOfItem] = new VoidItem()
        }
    }
}