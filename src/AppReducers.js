

const reducers = (state = [], action) => {
 switch (action.type) {
    case 'CHANGED_ELEMENT':
      return [
        ...state,
        action.element
      ];
    default:
      return state;
  }
};



export default reducers;
