export const addUniqueObject = (
  responseElements,
  arrayElements,
  filter,
  removedArrayElements
) => {
  for (let responseElement of responseElements) {
    const isElementAlreadySaved = arrayElements.some((arrayElement) => {
      return arrayElement[filter] === responseElement[filter];
    });
    const isElementAlreadyRemoved = removedArrayElements.some(
      (arrayElement) => {
        return arrayElement[filter] === responseElement[filter];
      }
    );
    if (
      (!isElementAlreadySaved && !isElementAlreadyRemoved) ||
      (arrayElements.length && removedArrayElements.length)
    ) {
      arrayElements.push(responseElement);
    }
  }
};
