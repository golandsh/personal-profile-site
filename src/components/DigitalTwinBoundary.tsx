"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface DigitalTwinBoundaryProps {
  readonly children: ReactNode;
}

interface DigitalTwinBoundaryState {
  readonly hasError: boolean;
}

/**
 * Isolates the Digital Twin widget so any unexpected client error
 * hides only the chat widget and never takes down the rest of the site.
 */
export class DigitalTwinBoundary extends Component<
  DigitalTwinBoundaryProps,
  DigitalTwinBoundaryState
> {
  constructor(props: DigitalTwinBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): DigitalTwinBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    // Intentionally swallow to keep the main profile site operational
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}
