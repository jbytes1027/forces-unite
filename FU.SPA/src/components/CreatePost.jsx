import {
  Button,
  TextField,
  Box,
  Container,
  Typography,
  Grid,
  Checkbox,
  Autocomplete,
  createFilterOptions,
  FormControl,
  FormHelperText,
} from '@mui/material';
import { useEffect, useState } from 'react';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import PostService from '../services/postService';
import TagService from '../services/tagService';
import GameService from '../services/gameService';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

export default function CreatePost() {
  const [game, setGame] = useState(null);
  const [title, setTitle] = useState(null);
  const [startTime, setStartTime] = useState(dayjs().add(5, 'minute'));
  const [endTime, setEndTime] = useState(dayjs().add(15, 'minute'));
  const [originalTime, setOriginalTime] = useState(dayjs()); //Time for initial start time
  const [maxTime, setMaxTime] = useState(dayjs().add(31, 'days')); //Time for maximum end time
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [startTimeError, setStartTimeError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if(startTime.isBefore(originalTime)) {
      setStartTimeError(true);
      return;
    }
  }, []);
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    let tagIds = [];

    for (const tag of tags) {
      const newTag = await TagService.findOrCreateTagByName(tag.name);
      tagIds.push(newTag.id);
    }

    if (
      game === '' ||
      game === null ||
      game.name === null ||
      game.name === '' ||
      game.name.length < 3
    ) {
      return;
    }

    var findGame = await GameService.findOrCreateGameByTitle(game.name);

    const post = {
      title: title,
      description: description,
      startTime: startTime !== null ? startTime.toISOString() : null,
      endTime: endTime !== null ? endTime.toISOString() : null,
      tagIds: tagIds,
      gameId: findGame.id,
    };

    try {
      if (game === null || game === '' || game.length < 3) {
        return;
      } else {
        const newPost = await PostService.createPost(post);
        navigate(`/posts/${newPost.id}`);
      }
    } catch (e) {
      window.alert(e);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 0,
          m: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Create Post
        </Typography>
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            mt: 0,
            gap: 1,
          }}
        >
          <TextField
            fullWidth
            error={title?.length < 3}
            id="searchGames"
            helperText={
              title?.length < 3 || title === null
                ? 'Must be at least 3 characters'
                : ''
            }
            minLength={3}
            maxLength={25}
            label="Title *"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Grid item xs={0}>
            <GameSelector onChange={setGame} />
          </Grid>
          <br />
          <FormControl error={startTimeError}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Start Time"
              value={startTime}
              error={startTime.isBefore(originalTime)}
              onChange={(newValue) => setStartTime(newValue)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  helperText={startTimeError 
                    ? 'Time must not be set before current time'
                    : ''
                  } 
                />
              )}
            />
            {/* {startTimeError && <FormHelperText>Please select a time</FormHelperText>} */}
            <DateTimePicker
              label="End Time"
              value={endTime}
              onChange={(newValue) => setEndTime(newValue)}
            />
            
          </LocalizationProvider>
          </FormControl>
          <TagsSelector onChange={setTags} />
          <Box
            sx={{
              display: 'flex',
            }}
          ></Box>
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
          ></TextField>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 0, mb: 0 }}
            disabled={
              !game ||
              !title ||
              game?.length < 3 ||
              title?.length < 3 ||
              game?.length == 2 ||
              title?.length === 2 ||
              title?.length === 1 ||
              game?.length === 1
            }
          >
            Create Post
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

const checkboxIconBlank = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkboxIconChecked = <CheckBoxIcon fontSize="small" />;
const filter = createFilterOptions();

const GameSelector = ({ onChange }) => {
  const [gameOptions, setGameOptions] = useState([]);
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchGameOptions = async () => {
      try {
        GameService.searchGames('').then((games) => setGameOptions(games));
        GameService.searchGames('').then((games) => setGameOptions(games));
      } catch (err) {
        console.log(err);
      }
    };
    fetchGameOptions();
  }, []);

  const onInputChange = (event, newValue) => {
    try {
      setValue(newValue);
      if (newValue && newValue.name && newValue.name.length < 3) {
        setError(true);
      } else {
        setError(false);
      }
      onChange(newValue);
    } catch (err) {
      setError(true);
    }
    setValue(newValue);
    onChange(newValue);
  };

  const onFilterOptions = (options, params) => {
    const filtered = filter(options, params);

    const { inputValue } = params;
    // Suggest the creation of a new value
    const isExisting = options.some((option) => inputValue === option.name);
    if (inputValue !== '' && !isExisting) {
      filtered.push({
        // inputValue,
        id: null,
        name: inputValue,
      });
    }

    return filtered;
  };

  return (
    <Autocomplete
      autoHighlight
      clearOnBlur
      value={value}
      onChange={onInputChange}
      options={gameOptions}
      filterOptions={onFilterOptions}
      getOptionLabel={(o) => (o ? o.name : '')}
      isOptionEqualToValue={(option, value) => option.name === value.name}
      renderOption={(props, option) => <li {...props}>{option.name}</li>}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          error={error}
          label="Game *"
          minLength={3}
          maxLength={25}
          helperText={
            error || value === null ? 'Must be at least 3 characters' : ''
          }
        />
      )}
    />
  );
};

const TagsSelector = ({ onChange }) => {
  const [tagOptions, setTagOptions] = useState([]);
  const [value, setValue] = useState([]);

  useEffect(() => {
    TagService.searchTags('').then((tags) => setTagOptions(tags));
  }, []);

  const onInputChange = (event, newValues) => {
    for (const newValue of newValues) {
      if (newValue.id === null) {
        // if not in options add to options
        if (!tagOptions.some((o) => o.name === newValue.name)) {
          const newOptions = tagOptions.concat([newValue]);
          setTagOptions(newOptions);
        }
      }
    }

    setValue(newValues);
    onChange(newValues);
  };

  const onFilterOptions = (options, params) => {
    const filtered = filter(options, params);

    const { inputValue } = params;
    // Suggest the creation of a new value
    const isExisting = options.some((option) => inputValue === option.name);
    if (inputValue !== '' && !isExisting) {
      filtered.push({
        // inputValue,
        id: null,
        name: inputValue,
      });
    }

    return filtered;
  };

  return (
    <Autocomplete
      autoHighlight
      multiple
      clearOnBlur
      value={value}
      onChange={onInputChange}
      options={tagOptions}
      disableCloseOnSelect
      filterOptions={onFilterOptions}
      getOptionLabel={(o) => o.name}
      isOptionEqualToValue={(option, value) => option.name === value.name}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox
            icon={checkboxIconBlank}
            checkedIcon={checkboxIconChecked}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {option.name}
        </li>
      )}
      renderInput={(params) => (
        <TextField {...params} label="Tags" placeholder="" />
      )}
    />
  );
};
