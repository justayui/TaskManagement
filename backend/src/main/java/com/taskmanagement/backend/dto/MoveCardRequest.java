package com.taskmanagement.backend.dto;

import java.util.UUID;

public record MoveCardRequest(
        UUID listId,
        int order
) {
}
