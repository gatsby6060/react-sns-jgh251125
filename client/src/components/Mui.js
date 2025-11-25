// import * as React from 'react';
// import Box from '@mui/material/Box';
// import Rating from '@mui/material/Rating';
// import Typography from '@mui/material/Typography';

// function Mui() {
//     // const [value, setValue] = React.useState<number | null>(2);
//     const [value, setValue] = React.useState(2);


//     return (
//         <>
//             <Box sx={{ '& > legend': { mt: 2 } }}>
//                 <Typography component="legend">Controlled</Typography>
//                 <Rating
//                     name="simple-controlled"
//                     value={value}
//                     onChange={(event, newValue) => {
//                         setValue(newValue);
//                     }}
//                 />
//                 <Typography component="legend">Uncontrolled</Typography>
//                 <Rating
//                     name="simple-uncontrolled"
//                     onChange={(event, newValue) => {
//                         console.log(newValue);
//                     }}
//                     defaultValue={2}
//                 />
//                 <Typography component="legend">Read only</Typography>
//                 <Rating name="read-only" value={value} readOnly />
//                 <Typography component="legend">Disabled</Typography>
//                 <Rating name="disabled" value={value} disabled />
//                 <Typography component="legend">No rating given</Typography>
//                 <Rating name="no-value" value={null} />
//             </Box>
//         </>
//     );
// }

// export default Mui;








import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

export default function StandardImageList() {
  return (
    <ImageList sx={{ width: 500, height: 450 }} cols={3} rowHeight={164}>
      {itemData.map((item) => (
        <ImageListItem key={item.img}>
          <img
            srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
            src={`${item.img}?w=164&h=164&fit=crop&auto=format`}
            alt={item.title}
            loading="lazy"
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
}

const itemData = [
  {
    img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
    title: 'Breakfast',
  },
  {
    img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
    title: 'Burger',
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
  },
  {
    img: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c',
    title: 'Coffee',
  },
  {
    img: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8',
    title: 'Hats',
  },
  {
    img: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
    title: 'Honey',
  },
  {
    img: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6',
    title: 'Basketball',
  },
  {
    img: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f',
    title: 'Fern',
  },
  {
    img: 'https://images.unsplash.com/photo-1597645587822-e99fa5d45d25',
    title: 'Mushrooms',
  },
  {
    img: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af',
    title: 'Tomato basil',
  },
  {
    img: 'https://images.unsplash.com/photo-1471357674240-e1a485acb3e1',
    title: 'Sea star',
  },
  {
    img: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6',
    title: 'Bike',
  },
];