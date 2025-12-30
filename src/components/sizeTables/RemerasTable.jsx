import "../../styles/product-size-tables.css";

export default function RemerasTable() {
  return (
    <div className="size-table">
      <h3>Remeras</h3>
      <table>
        <thead>
          <tr>
            <th></th><th>S</th><th>M</th><th>L</th><th>XL</th><th>XXL</th><th>3XL</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>HOMBROS</td><td>43cm</td><td>46cm</td><td>47cm</td><td>49cm</td><td>52cm</td><td>54cm</td></tr>
          <tr><td>PECHO</td><td>50cm</td><td>54cm</td><td>56cm</td><td>58cm</td><td>60cm</td><td>64cm</td></tr>
          <tr><td>LARGO</td><td>65cm</td><td>67cm</td><td>68cm</td><td>70cm</td><td>73cm</td><td>76cm</td></tr>
        </tbody>
      </table>
    </div>
  );
}
