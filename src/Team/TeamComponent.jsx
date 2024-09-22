import React, { useState, useEffect } from 'react';
import TeamService from '../service/TeamService';
import UserService from '../service/UserService';
import ProjectService from '../service/ProjectService';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const TeamComponent = () => {
  const [teams, setTeams] = useState([]);
  const [newTeam, setNewTeam] = useState({
    teamName: '',
    teamLead: '',
    members: [],
    projects: [],
  });
  const [teamLeads, setTeamLeads] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  const fetchData = async () => {
    try {
      const [teamsResponse, teamLeadsResponse, teamMembersResponse, projectsResponse] = await Promise.all([
        TeamService.getAll(),
        UserService.getUserByRole('manager'),
        UserService.getUserByRole('developer'),
        ProjectService.getAll(),
      ]);

      setTeams(teamsResponse.data);
      setTeamLeads(teamLeadsResponse.data);
      setTeamMembers(teamMembersResponse.data);
      setProjects(projectsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTeam((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await TeamService.createTeam(newTeam);
      setNewTeam({
        teamName: '',
        teamLead: '',
        members: [],
        projects: [],
      });
      await fetchData();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
      <Box p={4}>
        <Typography variant="h4" gutterBottom>
          Team Management
        </Typography>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
          >
            Add Team
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Team Name</TableCell>
                <TableCell>Team Lead</TableCell>
                <TableCell>Members</TableCell>
                <TableCell>Projects</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map((team) => {
                const teamLead = teamLeads.find((lead) => lead._id === team.teamLead);
                const teamMembersList = teamMembers.filter((member) => team.members.includes(member._id));
                const teamProjectsList = projects.filter((project) => team.projects.includes(project._id));

                return (
                    <TableRow key={team._id}>
                      <TableCell>{team.teamName}</TableCell>
                      <TableCell>{teamLead?.username || 'Not assigned'}</TableCell>
                      <TableCell>
                        {teamMembersList.map(member => (
                            <Chip key={member._id} label={member.username} size="small" style={{ margin: '2px' }} />
                        ))}
                      </TableCell>
                      <TableCell>
                        {teamProjectsList.map(project => (
                            <Chip key={project._id} label={project.ProjectName} size="small" style={{ margin: '2px' }} />
                        ))}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Team</DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <TextField
                  label="Team Name"
                  name="teamName"
                  value={newTeam.teamName}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  margin="normal"
              />
              <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel id="team-lead-label">Team Lead</InputLabel>
                <Select
                    labelId="team-lead-label"
                    name="teamLead"
                    value={newTeam.teamLead}
                    onChange={handleInputChange}
                    label="Team Lead"
                >
                  <MenuItem value="">Select a team lead</MenuItem>
                  {teamLeads.map((teamLead) => (
                      <MenuItem key={teamLead._id} value={teamLead._id}>
                        {teamLead.username}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel id="members-label">Members</InputLabel>
                <Select
                    labelId="members-label"
                    name="members"
                    multiple
                    value={newTeam.members}
                    onChange={handleInputChange}
                    label="Members"
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                              <Chip key={value} label={teamMembers.find(member => member._id === value)?.username} />
                          ))}
                        </Box>
                    )}
                >
                  {teamMembers.map((member) => (
                      <MenuItem key={member._id} value={member._id}>
                        {member.username}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel id="projects-label">Projects</InputLabel>
                <Select
                    labelId="projects-label"
                    name="projects"
                    multiple
                    value={newTeam.projects}
                    onChange={handleInputChange}
                    label="Projects"
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                              <Chip key={value} label={projects.find(project => project._id === value)?.ProjectName} />
                          ))}
                        </Box>
                    )}
                >
                  {projects.map((project) => (
                      <MenuItem key={project._id} value={project._id}>
                        {project.ProjectName}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSubmit} color="primary" variant="contained">
              Create Team
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default TeamComponent;