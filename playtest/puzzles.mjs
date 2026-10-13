// Six independently generated and exhaustively checked rounds per prototype.
export const PATCH = [
  {
    "starts": [
      3,
      9
    ],
    "ops": [
      {
        "kind": "+",
        "n": 5
      },
      {
        "kind": "*",
        "n": 2
      },
      {
        "kind": "-",
        "n": 2
      }
    ],
    "choices": [
      {
        "kind": "*",
        "n": 2
      },
      {
        "kind": "+",
        "n": 5
      },
      {
        "kind": "+",
        "n": 4
      }
    ],
    "goals": [
      32,
      56
    ],
    "check": {
      "lane": 0,
      "step": 1,
      "value": 8
    },
    "id": "patch-1"
  },
  {
    "starts": [
      5,
      10
    ],
    "ops": [
      {
        "kind": "*",
        "n": 3
      },
      {
        "kind": "+",
        "n": 2
      },
      {
        "kind": "*",
        "n": 2
      }
    ],
    "choices": [
      {
        "kind": "*",
        "n": 3
      },
      {
        "kind": "-",
        "n": 1
      },
      {
        "kind": "+",
        "n": 3
      }
    ],
    "goals": [
      16,
      31
    ],
    "check": {
      "lane": 1,
      "step": 1,
      "value": 30
    },
    "id": "patch-2"
  },
  {
    "starts": [
      3,
      11
    ],
    "ops": [
      {
        "kind": "-",
        "n": 2
      },
      {
        "kind": "*",
        "n": 3
      },
      {
        "kind": "*",
        "n": 2
      },
      {
        "kind": "+",
        "n": 4
      }
    ],
    "choices": [
      {
        "kind": "*",
        "n": 2
      },
      {
        "kind": "-",
        "n": 3
      },
      {
        "kind": "+",
        "n": 2
      },
      {
        "kind": "+",
        "n": 3
      },
      {
        "kind": "/",
        "n": 2
      }
    ],
    "goals": [
      9,
      33
    ],
    "check": {
      "lane": 0,
      "step": 2,
      "value": 3
    },
    "id": "patch-3"
  },
  {
    "starts": [
      4,
      7
    ],
    "ops": [
      {
        "kind": "*",
        "n": 3
      },
      {
        "kind": "-",
        "n": 2
      },
      {
        "kind": "-",
        "n": 1
      },
      {
        "kind": "+",
        "n": 3
      }
    ],
    "choices": [
      {
        "kind": "*",
        "n": 3
      },
      {
        "kind": "+",
        "n": 5
      },
      {
        "kind": "-",
        "n": 1
      },
      {
        "kind": "/",
        "n": 2
      },
      {
        "kind": "+",
        "n": 4
      }
    ],
    "goals": [
      13,
      22
    ],
    "check": {
      "lane": 1,
      "step": 2,
      "value": 20
    },
    "id": "patch-4"
  },
  {
    "starts": [
      4,
      10
    ],
    "ops": [
      {
        "kind": "+",
        "n": 4
      },
      {
        "kind": "-",
        "n": 2
      },
      {
        "kind": "-",
        "n": 1
      },
      {
        "kind": "*",
        "n": 2
      }
    ],
    "choices": [
      {
        "kind": "+",
        "n": 4
      },
      {
        "kind": "+",
        "n": 3
      },
      {
        "kind": "+",
        "n": 5
      },
      {
        "kind": "+",
        "n": 2
      },
      {
        "kind": "*",
        "n": 2
      }
    ],
    "goals": [
      20,
      32
    ],
    "check": {
      "lane": 0,
      "step": 2,
      "value": 6
    },
    "id": "patch-5"
  },
  {
    "starts": [
      3,
      10
    ],
    "ops": [
      {
        "kind": "+",
        "n": 5
      },
      {
        "kind": "-",
        "n": 3
      },
      {
        "kind": "+",
        "n": 5
      },
      {
        "kind": "-",
        "n": 3
      },
      {
        "kind": "+",
        "n": 3
      }
    ],
    "choices": [
      {
        "kind": "*",
        "n": 3
      },
      {
        "kind": "/",
        "n": 2
      },
      {
        "kind": "-",
        "n": 1
      },
      {
        "kind": "-",
        "n": 2
      },
      {
        "kind": "+",
        "n": 5
      }
    ],
    "goals": [
      12,
      19
    ],
    "check": {
      "lane": 1,
      "step": 2,
      "value": 14
    },
    "id": "patch-6"
  }
];
export const BORROW = [
  {
    "start": 2,
    "loan": 3,
    "cards": [
      {
        "kind": "*",
        "n": 2
      }
    ],
    "goal": 7,
    "id": "borrow-1"
  },
  {
    "start": 3,
    "loan": 2,
    "cards": [
      {
        "kind": "+",
        "n": 1
      },
      {
        "kind": "*",
        "n": 2
      }
    ],
    "goal": 10,
    "id": "borrow-2"
  },
  {
    "start": 5,
    "loan": 3,
    "cards": [
      {
        "kind": "*",
        "n": 2
      },
      {
        "kind": "-",
        "n": 4
      }
    ],
    "goal": 9,
    "id": "borrow-3"
  },
  {
    "start": 3,
    "loan": 3,
    "cards": [
      {
        "kind": "/",
        "n": 3
      },
      {
        "kind": "*",
        "n": 2
      },
      {
        "kind": "+",
        "n": 4
      }
    ],
    "goal": 5,
    "id": "borrow-4"
  },
  {
    "start": 4,
    "loan": 5,
    "cards": [
      {
        "kind": "*",
        "n": 3
      },
      {
        "kind": "-",
        "n": 2
      },
      {
        "kind": "/",
        "n": 2
      }
    ],
    "goal": 10,
    "id": "borrow-5"
  },
  {
    "start": 5,
    "loan": 4,
    "cards": [
      {
        "kind": "*",
        "n": 2
      },
      {
        "kind": "+",
        "n": 3
      },
      {
        "kind": "/",
        "n": 3
      }
    ],
    "goal": 5,
    "id": "borrow-6"
  }
];
