interface Item {
  id: string;
  duration: number;
  weight: number;
  allotedTime: {
    start: number;
    end: number;
  } | null;
}

const items: Item[] = Array.from({ length: 10 }, () => {
  return {
    id: crypto.randomUUID(),
    duration: Math.floor(Math.random() * 480), // 4 hours
    weight: Math.floor(Math.random() * 5) + 1,
    allotedTime: null,
  };
});

//allot the time in 24 hours
function allotTime(items: Item[]) {
  let usedTime = 0;

  items.forEach((item) => {
    item.allotedTime = {
      start: usedTime,
      end: usedTime + item.duration,
    };

    usedTime += item.duration;
  });
}

console.time("heavy-task");
items.sort((a, b) => a.weight - b.weight); //sort them from highest to lowest priority
allotTime(items);
console.timeEnd("heavy-task");

console.log(items);

// TODO:
// - [ ] Timeframes - items can choose on which time frame can they be scheduled
// - [ ] Buffer - time between each item
