import BackupRealmProvider from "./BackupRealmProvider";
import AppInitProvider from "./InitilizerProvider";

const Providers = () => {
  return (
    <>
      <AppInitProvider />
      <BackupRealmProvider />
    </>
  );
};

export default Providers;
