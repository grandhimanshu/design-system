import * as React from 'react';
import * as ReactDOM from 'react-dom';
import classNames from 'classnames';
import { BaseProps, extractBaseProps } from '@/utils/types';
import { OverlayFooter } from '@/components/molecules/overlayFooter';
import { OverlayHeader, OverlayHeaderProps } from '@/components/molecules/overlayHeader';
import { OverlayBody } from '@/components/molecules/overlayBody';
import { Row, Column, Button, Tooltip } from '@/index';
import { ColumnProps } from '@/index.type';
import { getWrapperElement, getUpdatedZIndex, closeOnEscapeKeypress, getFocusableElements, handleFocusTrapKeyDown } from '@/utils/overlayHelper';
import OverlayManager from '@/utils/OverlayManager';
import FocusScopeManager from '@/utils/FocusScopeManager';
import DismissableLayerManager from '@/utils/DismissableLayerManager';
import { FooterOptions } from '@/common.type';
import styles from '@css/components/fullscreenModal.module.css';

export type FullScreenDimension = 'medium' | 'large';

export interface FullscreenModalProps extends BaseProps {
  /**
   * Dimension of `Fullscreen Modal`
   */
  dimension: FullScreenDimension;

  /**
   * Handles open/close state
   */
  open: boolean;

  /**
   * onClose callback to be called on `Fullscreen Modal` close
   */
  onClose?: (event?: Event | React.MouseEvent<HTMLElement, MouseEvent>, reason?: string) => void;

  /**
   * Header options (doesn't work if `header` prop is used)
   *
   * Use `header` prop if custom header is needed.
   *
   * <pre className="DocPage-codeBlock">
   * Header:
   * {
   *    heading: string;
   *    subHeading?: string;
   *    backIcon?: boolean;
   *    backIconCallback?: (e) => void;
   *    backButton?: boolean;
   *    backButtonCallback?: (e) => void;
   * }
   * </pre>
   *
   * **`backIcon` and `backIconCallback` will soon be deprecated**
   *
   * | Name | Description |
   * | --- | --- |
   * | heading | Heading of `Sidesheet` |
   * | subHeading | Subheading of `Sidesheet` |
   * | backButton | Determines if back button is visible |
   * | backButtonCallback | Callback called when back button is clicked |
   * | backIcon | Determines if back button is visible |
   * | backIconCallback | Callback called when back button is clicked |
   */
  headerOptions?: OverlayHeaderProps;

  /**
   * header component to be used as modal header.
   * close button is not part of header so it will not be replaced.
   */
  header?: React.ReactNode;

  /**
   * Footer options (doesn't work if `footer` prop is used).
   *
   * Use `footer` prop if custom footer is needed.
   *
   * <pre className="DocPage-codeBlock">
   *  OverlayFooterOptions {
   *    actions: ButtonProps[];
   *  }
   * ([ButtonProps](https://mds.innovaccer.com/?path=/docs/components-button-button-all--all))
   * </pre>
   */
  footerOptions?: FooterOptions;

  /**
   * footer component to be used as modal footer.
   */
  footer?: React.ReactNode;

  /**
   * Element to be rendered as modal body.
   */
  children?: React.ReactNode;
  /**
   * Closes `FullScreenModal` when `Escape` key is pressed
   */
  closeOnEscape?: boolean;
}

interface ModalState {
  open: boolean;
  animate: boolean;
  zIndex?: number;
}

class FullscreenModal extends React.Component<FullscreenModalProps, ModalState> {
  modalRef = React.createRef<HTMLDivElement>();
  modalContentRef = React.createRef<HTMLDivElement>();
  previousActiveElement: HTMLElement | null = null;
  focusTrapActive: boolean = false;
  element: Element;

  static defaultProps = {
    dimension: 'medium',
  };

  constructor(props: FullscreenModalProps) {
    super(props);

    this.element = getWrapperElement();

    this.state = {
      open: props.open,
      animate: props.open,
    };
  }

  onOutsideClickHandler = (event: Event) => {
    this.deactivateFocusTrap();
    OverlayManager.remove(this.modalRef.current);

    if (this.props.onClose) {
      this.props.onClose(event, 'EscapePress');
    } else {
      this.setState(
        {
          animate: false,
        },
        () => {
          window.setTimeout(() => {
            this.setState({
              open: false,
            });
          }, 120);
        }
      );
    }
  };

  onFocusTrapKeyDown = (event: KeyboardEvent) => {
    const container = this.modalContentRef.current;
    if (!container) return;
    handleFocusTrapKeyDown(event, container);
  };

  onCloseHandler = (event: KeyboardEvent) => {
    const isTopOverlay = OverlayManager.isTopOverlay(this.modalRef.current);
    closeOnEscapeKeypress(event, isTopOverlay, this.onOutsideClickHandler);
  };

  activateFocusTrap = () => {
    this.previousActiveElement = document.activeElement as HTMLElement | null;
    const container = this.modalContentRef.current;
    if (!container) return;

    DismissableLayerManager.add(this.modalRef.current);
    FocusScopeManager.add(this.previousActiveElement, container);

    window.requestAnimationFrame(() => {
      const focusable = getFocusableElements(container);
      if (focusable.length > 0) {
        focusable[0].focus({ preventScroll: true });
      } else {
        container.setAttribute('tabindex', '-1');
        container.focus({ preventScroll: true });
      }
    });

    document.addEventListener('keydown', this.onFocusTrapKeyDown, true);
    container.addEventListener('keydown', this.onCloseHandler);
    this.focusTrapActive = true;
  };

  deactivateFocusTrap = () => {
    if (!this.focusTrapActive) return;
    this.focusTrapActive = false;

    document.removeEventListener('keydown', this.onFocusTrapKeyDown, true);

    const container = this.modalContentRef.current;
    if (container) {
      container.removeEventListener('keydown', this.onCloseHandler);
      container.removeAttribute('tabindex');
    }

    DismissableLayerManager.remove(this.modalRef.current);
    FocusScopeManager.remove(container);
  };

  componentDidMount() {
    if (this.props.closeOnEscape) {
      if (this.state.open) {
        OverlayManager.add(this.modalRef.current);
      }
    }

    const zIndex = getUpdatedZIndex({
      element: this.element,
      containerClassName: '.Overlay-container',
      elementRef: this.modalRef,
    });
    this.setState({
      zIndex,
    });

    if (this.state.open) {
      this.activateFocusTrap();
    }
  }

  componentWillUnmount() {
    if (this.state.open) {
      this.deactivateFocusTrap();
      OverlayManager.remove(this.modalRef.current);
    }
  }

  componentDidUpdate(prevProps: FullscreenModalProps) {
    if (prevProps.open !== this.props.open) {
      if (this.props.open) {
        const zIndex = getUpdatedZIndex({
          element: this.element,
          containerClassName: '.Overlay-container--open',
          elementRef: this.modalRef,
        });

        this.setState({
          zIndex,
          open: true,
          animate: true,
        });

        if (this.props.closeOnEscape) OverlayManager.add(this.modalRef.current);

        this.activateFocusTrap();
      } else {
        this.deactivateFocusTrap();
        if (this.props.closeOnEscape) OverlayManager.remove(this.modalRef.current);

        this.setState(
          {
            animate: false,
          },
          () => {
            window.setTimeout(() => {
              this.setState({
                open: false,
              });
            }, 120);
          }
        );
      }
    }
  }

  render() {
    const { animate, open, zIndex } = this.state;
    const { className, dimension, children, header, headerOptions, footer, footerOptions, onClose } = this.props;

    const classes = classNames(
      {
        [styles.FullscreenModal]: true,
        [styles['FullscreenModal-animation--open']]: animate,
        [styles['FullscreenModal-animation--close']]: !animate,
      },
      className
    );

    const ContainerClass = classNames({
      ['Overlay-container']: true,
      ['Overlay-container--open']: open,
    });

    const baseProps = extractBaseProps(this.props);
    const sizeMap: Record<FullscreenModalProps['dimension'], Partial<ColumnProps>> = {
      medium: {
        size: '4',
        sizeL: '6',
        sizeM: '6',
        sizeXS: '12',
      },
      large: {
        size: '6',
        sizeL: '8',
        sizeM: '8',
        sizeXS: '12',
      },
    };

    const ModalContainer = open ? (
      <div
        data-test="DesignSystem-FullscreenModalContainer"
        className={ContainerClass}
        data-layer={true}
        style={{ zIndex }}
      >
        <div
          data-test="DesignSystem-FullscreenModal"
          {...baseProps}
          className={classes}
          ref={(el) => {
            (this.modalContentRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            (this.modalRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          }}
        >
          <Row className="justify-content-center">
            <Column {...sizeMap[dimension]}>
              <Row className={styles['FullscreenModal-header']}>
                <Column>
                  {!header && <OverlayHeader data-test="DesignSystem-FullscreenModal--header" {...headerOptions} />}

                  {!!header && header}
                </Column>
                <Column className="flex-grow-0">
                  <Tooltip tooltip="Close">
                    <Button
                      icon="close"
                      appearance="transparent"
                      data-test="DesignSystem-FullscreenModal--CloseButton"
                      onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                        if (onClose) onClose(event, 'IconClick');
                      }}
                    />
                  </Tooltip>
                </Column>
              </Row>
              <OverlayBody data-test="DesignSystem-FullscreenModal--Body" className={styles['FullscreenModal-body']}>
                {children}
              </OverlayBody>
              {(!!footer || !!footerOptions) && (
                <OverlayFooter
                  data-test="DesignSystem-FullscreenModal--footer"
                  {...footerOptions}
                  open={open}
                  className={styles['FullscreenModal-footer']}
                >
                  {footer}
                </OverlayFooter>
              )}
            </Column>
          </Row>
        </div>
      </div>
    ) : null;

    const WrapperElement = ReactDOM.createPortal(ModalContainer, this.element);

    return <>{WrapperElement}</>;
  }
}

export default FullscreenModal;
