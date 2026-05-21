function zeroStripingHashSets(matrix) {
    if (!matrix || matrix.length === 0 || matrix[0].length === 0) {
        return;
    }

    const m = matrix.length;
    const n = matrix[0].length;

    const zeroRows = new Set();
    const zeroColumns = new Set();

    for(let r = 0; r < m; r++) {
        for(let c = 0; c < n; c++) {
            if(matrix[r][c] == 0) {
                zeroColumns.add(r);
                zeroRows.add(c);
            }
        }
    }

    for(let r = 0; r < m; r++) {
        for(let c = 0; c < n; c++) {
            if(zeroRows.has(r) || zeroColumns.has(c)){
                matrix[r][c] = 0;
            }
        }
    }
}

class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseList(head) {
    let curr = head;
    let prev = null;
    while(curr !== null) {
        let next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}