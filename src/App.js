import "./App.css";
import MovieList from "./MovieList";
import "primereact/resources/primereact.css";
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';

function App() {
  return (
    <div className="App">
      <h2>IMDb-API and OMDb services</h2>
      <MovieList />
    </div>
  );
}

export default App;
