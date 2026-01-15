import "../../styles/product-size-tables.css";

export default function GorrasTable() {
  return (
    <div className="size-table">
      <h3> Gorras</h3>
      <table>
        <thead>
          <tr>
            <th></th><th>S</th><th>M</th><th>L</th><th>XL</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>HOMBROS</td><td>36</td><td>1</td><td>36</td><td>36</td></tr>
          <tr><td>PECHO</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>
          <tr><td>LARGO</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>
        </tbody>
      </table>
    </div>
  );
}
