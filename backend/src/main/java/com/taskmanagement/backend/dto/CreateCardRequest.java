package com.taskmanagement.backend.dto;

import java.util.UUID;

public record CreateCardRequest(
        UUID listId,
        String title,
        String description
) {
}
