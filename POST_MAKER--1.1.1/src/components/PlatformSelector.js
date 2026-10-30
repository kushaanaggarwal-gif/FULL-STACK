function PlatformSelector({ selected, setSelected }) {

  const platforms = [
    "Twitter",
    "Facebook",
    "Instagram"
  ];

  function handleChange(platform) {

    if (selected.includes(platform)) {

      setSelected(selected.filter((item) => item !== platform));

    } else {

      setSelected([...selected, platform]);

    }

  }

  return (

    <div>

      <h3>Select Platform</h3>

      {platforms.map((platform) => (

        <div key={platform}>

          <input

            type="checkbox"

            checked={selected.includes(platform)}

            onChange={() => handleChange(platform)}

          />

          {platform}

        </div>

      ))}

    </div>

  );

}

export default PlatformSelector;