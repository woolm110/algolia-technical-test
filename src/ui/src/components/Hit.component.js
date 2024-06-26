import { Highlight } from "react-instantsearch";

export const Hit = ({ hit, onClick }) => (
  <div className="hit-item" onClick={() => onClick(hit)}>
    <div className="hit-item-inner">
      <img src={hit.image} alt={hit.name} />
      <div>
        <strong><Highlight attribute="name" hit={hit} /></strong>
      </div>
      <div>Rating: {hit.rating} stars</div>
      <div>{hit.description}</div>
      <div className="hit-item-price"><em>£{hit.price}</em></div>
    </div>
  </div>
);
