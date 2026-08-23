package com.taskmanagement.backend.dto;

import com.taskmanagement.backend.entity.Priority;

import java.time.LocalDate;
import java.util.UUID;

public record CreateCardRequest(
        UUID listId,
        String title,
        String description,
        Priority priority,
        LocalDate dueDate
) {
}
