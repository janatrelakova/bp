import { IconButton, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import './Search.css';

import * as React from 'react';

const Search = () => {
    return (
        <div className="search-input">
            <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search diagram"
                inputProps={{ 'aria-label': 'search diagram' }}
            />
            <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
                <SearchIcon />
            </IconButton>
        </div>
    );
}

export default Search;