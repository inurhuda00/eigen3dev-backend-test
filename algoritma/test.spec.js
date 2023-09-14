function reverseExceptNumber(string) {
  return string.replace(/[A-Za-z]+/, (match) =>
    match.split("").reverse().join("")
  );
}

function longest(sentence) {
  return sentence.split(" ").reduce((a, b) => (a.length > b.length ? a : b));
}

function diagonalSub(matrix) {
  let diagonalPertama = 0;
  let diagonalKedua = 0;

  for ([index, value] of matrix.entries()) {
    diagonalPertama += value[index];
    diagonalKedua += value[matrix.length - 1 - index];
  }

  return diagonalPertama - diagonalKedua;
}

function countWordsInQuery(INPUT, QUERY) {
  const counts = [];

  for (const [index, query] of QUERY.entries()) {
    counts[index] = 0;
    for (const input of INPUT) {
      if (input == query) {
        counts[index]++;
      }
    }
  }

  return counts;
}

it("should reverse alphabet except the number", () => {
  const input = "NEGIE1";
  const expected = "EIGEN1";
  const result = reverseExceptNumber(input);
  expect(result).toBe(expected);
});

it("should return the longest word in a sentence", () => {
  const sentence = "Saya sangat senang mengerjakan soal algoritma";
  const expected = "mengerjakan";
  const result = longest(sentence);
  expect(result).toBe(expected);
});

it("should count words in QUERY that are present in INPUT", () => {
  const INPUT = ["xc", "dz", "bbb", "dz"];
  const QUERY = ["bbb", "ac", "dz"];
  const expected = [1, 0, 2];
  const result = countWordsInQuery(INPUT, QUERY);
  expect(result).toEqual(expected);
});

it("should calculate the diagonal subtraction of a matrix", () => {
  const matrix = [
    [1, 2, 0],
    [4, 5, 6],
    [7, 8, 9],
  ];

  const expected = 3;
  const result = diagonalSub(matrix);
  expect(result).toBe(expected);
});
