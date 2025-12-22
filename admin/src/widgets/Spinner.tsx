const Spinner = ({ colorClass = "text-primary" }: any) => {
  return (
    <div className="flex justify-center">
      <span className={`loading loading-ring loading-lg ${colorClass}`}></span>
    </div>
  );
};

export default Spinner;
