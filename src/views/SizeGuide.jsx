// src/components/SizeGuide.jsx
import "../styles/sizeguide.css";
import bearPointer from "../assets/bear-pointer.png"; // tu osito señalador

export default function SizeGuide() {
  return (
    <section className="size-guide">
      <div className="size-guide-wrap">
        {/* Tablas centradas */}
        <div className="tables-side">
          <h2>Guía de Talles</h2>

          {/* Baby Tees */}
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

          {/* Crop Tops */}
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

          {/* Remeras */}
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

          <p className="note">
            * Las medidas pueden variar +/- 1 a 2cm<br />
            * Para obtener la circunferencia total del pecho multiplicar esta medida x2
          </p>
        </div>

        {/* Oso independiente a la izquierda del bloque centrado */}
        <aside className="bear-side">
          <img src={bearPointer} alt="Osito señalando talles" />
          <div className="bear-comment">
            Recordá que las medidas pueden variar +/- 1 a 2cm
          </div>
        </aside>
      </div>
    </section>
  );
}
