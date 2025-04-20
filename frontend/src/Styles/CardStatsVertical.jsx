// ** MUI Imports
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";

// ** Icons Imports
import Icon from '@mdi/react';
import { mdiDotsVertical } from '@mdi/js';

const CardStatsVertical = (props) => {
  // ** Props
  const { title, subtitle, color, icon, stats, trend, trendNumber } = props;

  return (
    <Card sx={{ backgroundColor: '#ffffff', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)', borderRadius: '12px' }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            marginBottom: 3.25,
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <Avatar
            sx={{
              boxShadow: 3,
              marginRight: 4,
              color: "common.white",
              backgroundColor: `${color}.main`,
            }}
          >
            {icon}
          </Avatar>
          <IconButton
            size="small"
            aria-label="settings"
            className="card-more-options"
            sx={{ color: "text.secondary" }}
          >
            <Icon path={mdiDotsVertical} size={1} color="currentColor" />
          </IconButton>
        </Box>
        <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
          {title}
        </Typography>
        <Box
          sx={{
            marginTop: 1,
            display: "flex",
            flexWrap: "wrap",
            marginBottom: 1,
            alignItems: "center",
          }}
          className=""
        >
          <Typography variant="h6" sx={{ mr: 2 }} className="">
            {stats}
          </Typography>

          <Typography
            className=""
            variant="caption"
            sx={{ color: trend === "positive" ? "success.main" : "error.main" }}
          >
            {trendNumber}
          </Typography>
        </Box>
        <Typography variant="caption">{subtitle}</Typography>
      </CardContent>
    </Card>
  );
};

export default CardStatsVertical;

CardStatsVertical.defaultProps = {
  color: "primary",
  trend: "positive",
};
