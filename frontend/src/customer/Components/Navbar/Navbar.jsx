import { Fragment, useEffect, useState, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../config/api";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';

const SearchBar = memo(({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="hidden md:block flex-grow max-w-xl mx-4">
      <div className="relative w-full">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full border border-gray-300 rounded-full py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
          placeholder="Search for products..."
        />
        <button type="submit" className="absolute inset-y-0 left-0 flex items-center justify-center pl-3">
          <svg
            className="h-5 w-5 text-gray-400 hover:text-blue-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.716 14.966A7.25 7.25 0 1114.35 8.33a7.25 7.25 0 01-6.634 6.635zM15.5 9.75a5.75 5.75 0 10-11.5 0 5.75 5.75 0 0011.5 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </form>
  );
});

const MobileMenu = memo(({ showMenu, categories }) => (
  showMenu && (
    <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
      <ul className="flex flex-col py-4 space-y-2 px-5">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              to={`/${category.name.toLowerCase()}`}
              className="font-medium text-gray-700 hover:text-blue-600 block py-2 transition-colors"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
));

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await api.get('/api/categories');
        const topLevelCategories = response.data.filter(cat => cat.level === 1);
        setCategories(topLevelCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleShowMenu = () => {
    setShowMenu(prev => !prev);
  };

  return (
    <Fragment>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={handleShowMenu} 
                className="md:hidden text-gray-500 hover:text-gray-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-label="Toggle menu"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              <Link to="/" className="flex items-center">
                <img
                  src="https://res.cloudinary.com/ddkso1wxi/image/upload/v1675919455/Logo/Copy_of_Zosh_Academy_nblljp.png"
                  alt="Ecom"
                  className="h-8 w-8 mr-2"
                />
                <span className="font-bold text-gray-800 text-lg">
                  Shop With Zosh
                </span>
              </Link>
            </div>

            <ul className="hidden md:flex items-center space-x-8">
              {!loadingCategories && categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/${category.name.toLowerCase()}`}
                    className="font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center space-x-4">
              <SearchBar />

              <div className="hidden md:flex items-center space-x-6">
                <Link to="/profile" className="text-gray-700 hover:text-blue-600 transition-colors flex items-center">
                  <PersonIcon className="h-5 w-5 mr-1" />
                  <span>Profile</span>
                </Link>
                <Link to="/cart" className="text-gray-700 hover:text-blue-600 transition-colors flex items-center">
                  <ShoppingCartIcon className="h-5 w-5 mr-1" />
                  <span>Cart</span>
                </Link>
              </div>

              <div className="md:hidden flex items-center space-x-4">
                <Link to="/profile" className="text-gray-700 hover:text-blue-600 p-2">
                  <PersonIcon className="h-6 w-6" />
                </Link>
                <Link to="/cart" className="text-gray-700 hover:text-blue-600 p-2">
                  <ShoppingCartIcon className="h-6 w-6" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <MobileMenu showMenu={showMenu} categories={categories} />
    </Fragment>
  );
};

export default memo(Navbar);
