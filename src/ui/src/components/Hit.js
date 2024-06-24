export const Hit = ({ hit, onClick }) => (
  <div className="hit-item" onClick={() => onClick(hit)}>
    <div className="hit-item-inner">
      <img src={hit.image} alt={hit.name} />
      <div>
        <strong>{hit.name}</strong>
      </div>
      <div>{hit.description}</div>
    </div>
  </div>
);
