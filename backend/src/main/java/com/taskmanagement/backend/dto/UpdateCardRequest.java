package com.taskmanagement.backend.dto;

import com.taskmanagement.backend.entity.Priority;

import java.time.LocalDate;

public record UpdateCardRequest(
        String title,
        String description,
        Priority priority,
        LocalDate dueDate
) {
}
