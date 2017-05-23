import * as React from 'react';
import ResultList from './ResultList';
import SearchFilter from './SearchFilter';
import './App.css';

export interface Props {
  name: string;
  enthusiasmLevel?: number;
  onIncrement: () => void;
  onDecrement?: () => void;
}

function App (props: Props) {

  const items = [
    {'type': 'song', 'name': 'test song', 'uri': 'spotify:album:1AgxixpOQxXHohzTALF6Zm'}
  ];

  return (
    <div className="App">
      <SearchFilter onFilterChange={props.onIncrement} />
      <ResultList items={items} />
    </div>
  );
}


export default App;
