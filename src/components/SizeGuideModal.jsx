import React from "react";

export default function SizeGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="size-guide-overlay" onClick={onClose}>
      <div className="size-guide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="size-guide-header">
          <h2><i className="fas fa-ruler"></i> Guía de Tallas</h2>
          <button type="button" className="size-guide-close" onClick={onClose}>&times;</button>
        </div>
        <div className="size-guide-content">
          <div className="size-guide-measure">
            <h4><i className="fas fa-tape"></i> ¿Cómo medir?</h4>
            <ul>
              <li><strong>Pecho:</strong> Mide alrededor de la parte más ancha del pecho.</li>
              <li><strong>Largo:</strong> Mide desde el hombro hasta el borde inferior.</li>
              <li><strong>Hombros:</strong> Mide de extremo a extremo de los hombros.</li>
            </ul>
          </div>
          <table className="size-guide-table">
            <thead>
              <tr>
                <th>Talla</th>
                <th>Pecho (cm)</th>
                <th>Largo (cm)</th>
                <th>Hombros (cm)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>S</strong></td><td>86 - 91</td><td>68</td><td>44</td></tr>
              <tr><td><strong>M</strong></td><td>91 - 96</td><td>70</td><td>46</td></tr>
              <tr><td><strong>L</strong></td><td>96 - 101</td><td>72</td><td>48</td></tr>
              <tr><td><strong>XL</strong></td><td>101 - 106</td><td>74</td><td>50</td></tr>
              <tr><td><strong>XXL</strong></td><td>106 - 111</td><td>76</td><td>52</td></tr>
            </tbody>
          </table>
          <div className="size-guide-tip">
            <strong><i className="fas fa-lightbulb"></i> Consejo:</strong> Si estás entre dos tallas, te recomendamos elegir la talla más grande para un ajuste más cómodo.
          </div>
        </div>
      </div>
    </div>
  );
}
