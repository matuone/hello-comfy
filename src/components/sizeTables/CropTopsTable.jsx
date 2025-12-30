import "../../styles/product-size-tables.css";

export default function CropTopsTable() {
  return (
    <div className="size-table">
      <h3>Crop Tops</h3>
      <table>
        <thead>
          <tr>
            <th></th><th>S</th><th>M</th><th>L</th><th>XL</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>HOMBROS</td><td>37cm</td><td>39cm</td><td>40cm</td><td>42cm</td></tr>
          <tr><td>PECHO</td><td>40cm</td><td>42cm</td><td>44cm</td><td>46cm</td></tr>
          <tr><td>LARGO</td><td>46cm</td><td>50cm</td><td>52cm</td><td>54cm</td></tr>
        </tbody>
      </table>
    </div>
  );
}
