import "../../styles/product-size-tables.css";

export default function GorrasTable() {
  return (
    <div className="size-table">
      <h3>Gorras</h3>
      <table>
        <thead>
          <tr>
            <th></th><th>S</th><th>M</th><th>L</th><th>XL</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>HOMBROS</td><td>3</td><td>2</td><td>3</td><td>45</td></tr>
          <tr><td>PECHO</td><td>345</td><td>544</td><td>3455</td><td>4</td></tr>
          <tr><td>LARGO</td><td>55</td><td>54</td><td>4</td><td>54</td></tr>
        </tbody>
      </table>
    </div>
  );
}
