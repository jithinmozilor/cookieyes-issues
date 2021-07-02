const sum = queries[i + 1].split(' ').reduce((acc, curr) => {
  acc + parseInt(curr)
}, 0)