import * as React from 'react';
import { Listbox, Card, CardFooter, Button, Text, Checkbox, Heading, Divider } from '@/index';
import { ListboxItem } from '../listboxItem';
import './style.css';

export const reorderList = () => {
  const [list, setList] = React.useState([
    { name: 'Priority', checked: true },
    { name: 'Scheduled', checked: true },
    { name: 'Patient', checked: false },
    { name: 'Activity details', checked: true },
    { name: 'Note', checked: true },
    { name: 'Care gaps', checked: false },
    { name: 'HHS', checked: true },
    { name: 'CDPS', checked: true },
    { name: 'Patient', checked: false },
  ]);

  const [focusedRow, setFocusedRow] = React.useState(-1);

  const handleToggle = (index) => {
    setList((prevList) => prevList.map((item, i) => (i === index ? { ...item, checked: !item.checked } : item)));
  };

  return (
    // style.css
    // .Listbox-wrapper {
    //   height: var(--spacing-640);
    // }

    <Card className="w-50" shadow="none">
      <div className="pt-6 ml-6 mb-5">
        <Heading>Todo’s table columns</Heading>
        <Text appearance="subtle">Select the columns that you want to see in work list</Text>
      </div>
      <Divider />
      <Listbox
        showDivider={true}
        type="description"
        draggable={true}
        aria-label="Table column options"
        className="Listbox-wrapper overflow-auto"
      >
        {list.map((record, key) => {
          const labelId = `reorder-list-item-${key}`;
          return (
            <Listbox.Item
              key={key + 1}
              id={key + 1}
              onFocus={() => setFocusedRow(key)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setFocusedRow(-1);
              }}
            >
              <div className="d-flex align-items-center w-100 justify-content-between">
                <Text id={labelId}>{record.name}</Text>
                <Checkbox
                  checked={record.checked}
                  onChange={() => handleToggle(key)}
                  aria-labelledby={labelId}
                  tabIndex={focusedRow === key ? 0 : -1}
                />
              </div>
            </Listbox.Item>
          );
        })}
      </Listbox>

      <CardFooter className="bg-light justify-content-end position-relative">
        <>
          <Button appearance="basic">Cancel</Button>
          <Button appearance="primary" className="ml-4">
            Submit
          </Button>
        </>
      </CardFooter>
    </Card>
  );
};

const customCode = `() => {
  const [list, setList] = React.useState([
    { name: 'Priority', checked: true },
    { name: 'Scheduled', checked: true },
    { name: 'Patient', checked: false },
    { name: 'Activity details', checked: true },
    { name: 'Note', checked: true },
    { name: 'Care gaps', checked: false },
    { name: 'HHS', checked: true },
    { name: 'CDPS', checked: true },
    { name: 'Patient', checked: false },
  ]);

  const [focusedRow, setFocusedRow] = React.useState(-1);

  const handleToggle = (index) => {
    setList((prevList) =>
      prevList.map((item, i) => (i === index ? { ...item, checked: !item.checked } : item))
    );
  };

  return (
    <Card className="w-50" shadow="none">
      <div className="pt-6 ml-6 mb-5">
        <Heading>Todo’s table columns</Heading>
        <Text appearance="subtle">Select the columns that you want to see in work list</Text>
      </div>
      <Divider />
      <Listbox
        showDivider={true}
        type="description"
        draggable={true}
        aria-label="Table column options"
        className="Listbox-wrapper overflow-auto"
      >
        {list.map((record, key) => {
          const labelId = \`reorder-list-item-\${key}\`;
          return (
            <Listbox.Item 
              key={key + 1} 
              id={key + 1}
              onFocus={() => setFocusedRow(key)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setFocusedRow(-1);
              }}
            >
              <div className="d-flex align-items-center w-100 justify-content-between">
                <Text id={labelId}>{record.name}</Text>
                <Checkbox 
                  checked={record.checked} 
                  onChange={() => handleToggle(key)}
                  aria-labelledby={labelId} 
                  tabIndex={focusedRow === key ? 0 : -1} 
                />
              </div>
            </Listbox.Item>
          );
        })}
      </Listbox>

      <CardFooter className="bg-light justify-content-end position-relative">
        <>
          <Button appearance="basic">Cancel</Button>
          <Button appearance="primary" className="ml-4">
            Submit
          </Button>
        </>
      </CardFooter>
    </Card>
  );
}`;

export default {
  title: 'Components/Listbox/Reorder List',
  component: Listbox,
  subcomponents: { Listbox, ListboxItem },
  parameters: {
    docs: {
      docPage: {
        customCode,
        title: 'Listbox',
      },
    },
  },
};
