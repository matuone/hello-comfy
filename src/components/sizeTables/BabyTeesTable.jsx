import "../../styles/product-size-tables.css";


export default function BabyTeesTable() {
  return (
    <div className="size-table">
      <h3>Baby Tees</h3>
      <table>
        <thead>
          <tr>
            <th></th><th>S</th><th>M</th><th>L</th><th>XL</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>HOMBROS</td><td>36cm</td><td>39cm</td><td>40cm</td><td>43cm</td></tr>
          <tr><td>PECHO</td><td>42cm</td><td>43cm</td><td>45cm</td><td>48cm</td></tr>
          <tr><td>LARGO</td><td>49cm</td><td>50cm</td><td>51cm</td><td>53cm</td></tr>
          <tr><td>MANGAS</td><td>12cm</td><td>13cm</td><td>14cm</td><td>15cm</td></tr>
        </tbody>
      </table>
    </div>
  );
}
