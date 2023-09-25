import cat from './cat.jpg';
import './App.css';

function App() {
  return (
      <div className="App">
        <h1> hello from app.js</h1>
        <img src={cat} alt="picture of cat"/>
      </div>
  );
}

export default App;