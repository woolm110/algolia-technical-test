export function Panel({
  children,
  header,
}) {
  console.log('header :>> ', header);
  return (
    <div className="ais-Panel">
      {header && <div className="ais-Panel-header">{header}</div>}
      <div className="ais-Panel-body">{children}</div>
    </div>
  );
}
