
import { useContext} from 'react';
import BooksContext from '../contexts/books';

function useBooksContext() {
    return useContext(BooksContext);
};

export default useBooksContext;