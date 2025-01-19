import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Typography,
    Autocomplete,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
    SaveAlt as SaveIcon,
} from '@mui/icons-material';
import { debounce } from 'lodash';
import cacheService from '../../service/CacheService';

const AdvancedProjectSearch = ({ onSearch }) => {
    const [searchParams, setSearchParams] = useState({
        keyword: '',
        status: [],
        dateRange: {
            start: '',
            end: '',
        },
        teams: [],
        priority: [],
        tags: [],
    });

    const [savedFilters, setSavedFilters] = useState([]);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [suggestions, setSuggestions] = useState({
        teams: [],
        tags: [],
    });

    // Load saved filters from localStorage
    useEffect(() => {
        const filters = localStorage.getItem('savedFilters');
        if (filters) {
            setSavedFilters(JSON.parse(filters));
        }
    }, []);

    // Load suggestions
    useEffect(() => {
        const loadSuggestions = async () => {
            try {
                // Check cache first
                const cachedSuggestions = cacheService.get('searchSuggestions');
                if (cachedSuggestions) {
                    setSuggestions(cachedSuggestions);
                    return;
                }

                // If not in cache, fetch from API
                const [teamsResponse, tagsResponse] = await Promise.all([
                    fetch('/api/teams').then(res => res.json()),
                    fetch('/api/tags').then(res => res.json()),
                ]);

                const newSuggestions = {
                    teams: teamsResponse,
                    tags: tagsResponse,
                };

                setSuggestions(newSuggestions);
                cacheService.set('searchSuggestions', newSuggestions, 30); // Cache for 30 minutes
            } catch (error) {
                console.error('Error loading suggestions:', error);
            }
        };

        loadSuggestions();
    }, []);

    const handleSearch = debounce(() => {
        onSearch(searchParams);
    }, 300);

    const handleInputChange = (field, value) => {
        setSearchParams(prev => ({
            ...prev,
            [field]: value
        }));
        handleSearch();
    };

    const handleSaveFilter = () => {
        const newFilter = {
            name: `Filter ${savedFilters.length + 1}`,
            params: searchParams,
        };

        const updatedFilters = [...savedFilters, newFilter];
        setSavedFilters(updatedFilters);
        localStorage.setItem('savedFilters', JSON.stringify(updatedFilters));
    };

    const handleClearFilters = () => {
        setSearchParams({
            keyword: '',
            status: [],
            dateRange: {
                start: '',
                end: '',
            },
            teams: [],
            priority: [],
            tags: [],
        });
        handleSearch();
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
                {/* Search Bar */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search projects..."
                        value={searchParams.keyword}
                        onChange={(e) => handleInputChange('keyword', e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                            endAdornment: (
                                <Box>
                                    <Tooltip title="Advanced Filters">
                                        <IconButton
                                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                        >
                                            <FilterIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Clear Filters">
                                        <IconButton onClick={handleClearFilters}>
                                            <ClearIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Save Filter">
                                        <IconButton onClick={handleSaveFilter}>
                                            <SaveIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            ),
                        }}
                    />
                </Grid>

                {/* Advanced Filters */}
                {showAdvancedFilters && (
                    <>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    multiple
                                    value={searchParams.status}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="on-hold">On Hold</MenuItem>
                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                multiple
                                options={suggestions.teams}
                                getOptionLabel={(option) => option.name}
                                value={searchParams.teams}
                                onChange={(_, newValue) => handleInputChange('teams', newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Teams"
                                        placeholder="Select teams"
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Start Date"
                                type="date"
                                value={searchParams.dateRange.start}
                                onChange={(e) => handleInputChange('dateRange', {
                                    ...searchParams.dateRange,
                                    start: e.target.value
                                })}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="End Date"
                                type="date"
                                value={searchParams.dateRange.end}
                                onChange={(e) => handleInputChange('dateRange', {
                                    ...searchParams.dateRange,
                                    end: e.target.value
                                })}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                freeSolo
                                options={suggestions.tags}
                                value={searchParams.tags}
                                onChange={(_, newValue) => handleInputChange('tags', newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Tags"
                                        placeholder="Add tags"
                                    />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            label={option}
                                            {...getTagProps({ index })}
                                        />
                                    ))
                                }
                            />
                        </Grid>
                    </>
                )}

                {/* Saved Filters */}
                {savedFilters.length > 0 && (
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                            Saved Filters
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {savedFilters.map((filter, index) => (
                                <Chip
                                    key={index}
                                    label={filter.name}
                                    onClick={() => {
                                        setSearchParams(filter.params);
                                        handleSearch();
                                    }}
                                    onDelete={() => {
                                        const updatedFilters = savedFilters.filter((_, i) => i !== index);
                                        setSavedFilters(updatedFilters);
                                        localStorage.setItem('savedFilters', JSON.stringify(updatedFilters));
                                    }}
                                />
                            ))}
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
};

export default AdvancedProjectSearch;
