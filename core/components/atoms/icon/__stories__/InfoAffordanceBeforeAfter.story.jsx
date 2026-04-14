import * as React from 'react';
import {
  Caption,
  Column,
  Heading,
  Icon,
  InlineMessage,
  Input,
  Label,
  LinkButton,
  Message,
  Row,
  Subheading,
  Text,
  Toast,
  Tooltip,
} from '@/index';

const infoTooltip = 'Non-blocking context. Use for hints, definitions, or optional detail.';
const inputShellStyle = {
  display: 'flex',
  alignItems: 'center',
  minWidth: 256,
  border: 'var(--border-width-2-5) solid var(--secondary)',
  borderRadius: 'var(--border-radius-10)',
  paddingLeft: 'var(--spacing-30)',
  paddingRight: 'var(--spacing-10)',
  boxSizing: 'border-box',
};
const inputFieldStyle = {
  flex: 1,
  border: 'none',
  outline: 'none',
  font: 'inherit',
  minWidth: 0,
  paddingTop: 'var(--spacing-20)',
  paddingBottom: 'var(--spacing-20)',
  background: 'transparent',
};
const messageShellStyle = {
  display: 'flex',
  width: '100%',
  maxWidth: 520,
  padding: 'var(--spacing-30) var(--spacing-60) var(--spacing-30) var(--spacing-40)',
  border: 'var(--border-width-2-5) solid var(--primary)',
  borderRadius: 'var(--border-radius-10)',
  backgroundColor: 'var(--primary-lighter)',
  boxSizing: 'border-box',
};
const toastShellStyle = {
  display: 'flex',
  width: 360,
  boxSizing: 'border-box',
  wordBreak: 'break-word',
  borderRadius: 'var(--border-radius-10)',
  padding: 'var(--spacing-30) var(--spacing-30) var(--spacing-40) var(--spacing-40)',
  backgroundColor: 'var(--primary)',
};

export const infoAffordanceBeforeAfter = () => (
  <div className="p-8" style={{ maxWidth: 960 }}>
    <Heading size="m" className="mb-4">
      Info affordance: before vs after
    </Heading>
    <Text appearance="subtle" className="mb-6">
      Info cues use a lighter outlined icon. Error and alert stay filled so they remain visually heavier than guidance.
    </Text>
    <Text appearance="subtle" className="mb-8">
      Button and LinkButton already use the outlined info affordance next to tooltips, so that pattern did not need to
      change.
    </Text>
    <div className="mb-8 d-flex align-items-center flex-wrap">
      <LinkButton tooltip="Example tooltip on a text control">View coverage rules</LinkButton>
    </div>

    <Subheading className="mb-4">Raw icons</Subheading>
    <Row>
      <Column size={6}>
        <Text weight="medium" className="mb-4">
          Before (filled info)
        </Text>
        <div className="d-flex align-items-start" style={{ gap: 'var(--spacing-40)' }}>
          <div className="d-flex flex-column align-items-center">
            <Icon name="info" size={20} appearance="info" aria-hidden="true" />
            <Caption className="mt-3">info (rounded)</Caption>
          </div>
          <div className="d-flex flex-column align-items-center">
            <Icon name="error" size={20} appearance="alert" aria-hidden="true" />
            <Caption className="mt-3">error (unchanged)</Caption>
          </div>
        </div>
      </Column>
      <Column size={6}>
        <Text weight="medium" className="mb-4">
          After (outlined info)
        </Text>
        <div className="d-flex align-items-start" style={{ gap: 'var(--spacing-40)' }}>
          <div className="d-flex flex-column align-items-center">
            <Icon name="info_outline" type="outlined" size={20} appearance="info" aria-hidden="true" />
            <Caption className="mt-3">info_outline (outlined)</Caption>
          </div>
          <div className="d-flex flex-column align-items-center">
            <Icon name="error" size={20} appearance="alert" aria-hidden="true" />
            <Caption className="mt-3">error (unchanged)</Caption>
          </div>
        </div>
      </Column>
    </Row>

    <Subheading className="mb-4 mt-8">Label (info tooltip)</Subheading>
    <Row>
      <Column size={6}>
        <Text weight="medium" className="mb-4">
          Before (filled info)
        </Text>
        <div className="d-flex align-items-center">
          <Text>Visit date</Text>
          <Tooltip tooltip={infoTooltip}>
            <Icon
              name="info"
              size={12}
              appearance="subtle"
              aria-label={infoTooltip}
              className="ml-3 cursor-pointer d-flex align-items-center"
            />
          </Tooltip>
        </div>
      </Column>
      <Column size={6}>
        <Text weight="medium" className="mb-4">
          After (outlined info)
        </Text>
        <Label info={infoTooltip}>Visit date</Label>
      </Column>
    </Row>

    <Subheading className="mb-4 mt-8">Input (info tooltip)</Subheading>
    <Row>
      <Column size={6}>
        <Text weight="medium" className="mb-4">
          Before (filled info)
        </Text>
        <div style={inputShellStyle}>
          <input readOnly placeholder="you@example.com" aria-label="Email address" style={inputFieldStyle} />
          <Tooltip position="bottom" tooltip={infoTooltip}>
            <div className="d-flex align-items-center" role="presentation">
              <Icon name="info" size={16} appearance="subtle" aria-hidden="true" className="p-3" />
            </div>
          </Tooltip>
        </div>
      </Column>
      <Column size={6}>
        <Text weight="medium" className="mb-4">
          After (outlined info)
        </Text>
        <Input
          className="w-25"
          name="info-affordance-email"
          type="email"
          placeholder="you@example.com"
          info={infoTooltip}
          aria-label="Email address"
          readOnly
        />
      </Column>
    </Row>

    <Subheading className="mb-4 mt-8">Message</Subheading>
    <Row>
      <Column size={6}>
        <Text weight="medium" className="mb-4">
          Before (filled info)
        </Text>
        <div style={messageShellStyle}>
          <Icon
            name="info"
            size={16}
            appearance="info"
            aria-hidden="true"
            style={{ marginRight: 'var(--spacing-40)', paddingTop: 'var(--spacing-05)' }}
          />
          <div>
            <Heading size="s" color="primary">
              Eligibility updated
            </Heading>
            <Text color="primary">Review the new criteria before scheduling.</Text>
          </div>
        </div>
      </Column>
      <Column size={6}>
        <Text weight="medium" className="mb-4">
          After (outlined info)
        </Text>
        <Message
          appearance="info"
          title="Eligibility updated"
          description="Review the new criteria before scheduling."
        />
      </Column>
    </Row>

    <Subheading className="mb-4 mt-8">Inline message</Subheading>
    <Row>
      <Column size={6}>
        <Text weight="medium" className="mb-4">
          Before (filled info)
        </Text>
        <div className="d-flex align-items-start">
          <Icon
            name="info"
            size={16}
            appearance="info"
            aria-hidden="true"
            style={{ marginRight: 'var(--spacing-20)', paddingTop: 'var(--spacing-05)' }}
          />
          <Text color="primary">There are two new referral requests.</Text>
        </div>
      </Column>
      <Column size={6}>
        <Text weight="medium" className="mb-4">
          After (outlined info)
        </Text>
        <InlineMessage appearance="info" description="There are two new referral requests." />
      </Column>
    </Row>

    <Subheading className="mb-4 mt-8">Toast</Subheading>
    <Row>
      <Column size={6}>
        <Text weight="medium" className="mb-4">
          Before (filled info)
        </Text>
        <div style={toastShellStyle}>
          <Icon
            name="info"
            size={16}
            appearance="white"
            aria-hidden="true"
            style={{ marginRight: 'var(--spacing-40)', lineHeight: 'var(--font-height-m)' }}
          />
          <div>
            <Heading size="s" appearance="white">
              Visit scheduled
            </Heading>
            <Text appearance="white">Details follow in your inbox.</Text>
          </div>
        </div>
      </Column>
      <Column size={6}>
        <Text weight="medium" className="mb-4">
          After (outlined info)
        </Text>
        <Toast appearance="info" title="Visit scheduled" message="Details follow in your inbox." />
      </Column>
    </Row>

    <Subheading className="mb-4 mt-8">Alert / error (still filled)</Subheading>
    <Row>
      <Column size={6}>
        <Text weight="medium" className="mb-4">
          Before
        </Text>
        <InlineMessage appearance="alert" description="Member ID is not on file." />
      </Column>
      <Column size={6}>
        <Text weight="medium" className="mb-4">
          After (unchanged)
        </Text>
        <InlineMessage appearance="alert" description="Member ID is not on file." />
      </Column>
    </Row>
    <Text appearance="subtle" className="mt-3">
      Alert and error paths keep the filled error glyph so they stay visually distinct from informational guidance.
    </Text>
  </div>
);

export default {
  title: 'Components/Icon/Info Affordance Before After',
  component: Icon,
  parameters: {
    docs: {
      docPage: {
        title: 'Info affordance (before vs after)',
      },
    },
  },
};
