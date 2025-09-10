import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import TileContainer from '../TileContainer';

export default {
	title: 'Components/TileContainer',
	component: TileContainer,
} as ComponentMeta<typeof TileContainer>;

const Template: ComponentStory<typeof TileContainer> = (args: any) => (
	<TileContainer {...args}>Tile content</TileContainer>
);

export const Default = Template.bind({});
Default.args = {
	id: 'example',
};
