import Navbar from '../shared-components/Navbar';
import Footer from '../shared-components/Footer';

const LogError = () => {
  return (
    <div className=" bg-warmscale-7 h-screen w-screen font-ubuntu flex flex-col  text-lightscale-3">
      <Navbar />
      <div className="h-full w-full flex-col justify-center space-y-6 items-center px-20 flex">
        <h1 className="text-5xl">
          We've run into a problem with this log. :&#40;
        </h1>
        <p className="">
          We hit some kind of error. Either we can't find the data or it's
          unreadable. Let us know at{' '}
          <a
            className="underline hover:text-tf-orange-dark transition duration-200"
            target="_blank"
            href="https://github.com/calisirmori/more.tf"
            rel="noreferrer"
          >
            our GitHub
          </a>{' '}
          and we'll look into it further.
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default LogError;
