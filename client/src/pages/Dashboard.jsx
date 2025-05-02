import Dashbar from "../components/Dashboard/Dashbar";
import ViewBox from "../components/Dashboard/ViewBox";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0">
        <Dashbar />
      </aside>
      <main className="flex-grow">
        <ViewBox />
      </main>
    </div>
  );
};

export default Dashboard;
