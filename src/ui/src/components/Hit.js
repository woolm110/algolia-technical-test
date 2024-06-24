export const Hit = ({ hit }) => (
  <div className="hit-item">
    <div className="hit-item-inner">
      <img src={hit.image} alt={hit.name} />
      <div>
        <strong>{hit.name}</strong>
      </div>
      <div>{hit.description}</div>
    </div>
  </div>
);
